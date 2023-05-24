import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { onSnapshot, addDoc, doc, deleteDoc, setDoc} from "firebase/firestore"
import { notesCollection, db } from "./firebase" 


export default function App() {
    const [notes, setNotes] = React.useState(() => JSON.parse(localStorage.getItem("notes")) || [])
    const [currentNoteId, setCurrentNoteId] = React.useState("")

    const currentNote = 
        notes.find(note => note.id === currentNoteId) 
        || notes[0]

    // connects to the firebase Database 
    React.useEffect(() => {
        //onSnapshot creates a listener that is always watching the DB
        //  for changes. Returns a function that will disconnect
        const unsubscribe = onSnapshot(notesCollection, (snapShot) => {
            const notesArr = snapShot.docs.map(entry => ({
                ...entry.data(),
                id: entry.id
            }))
            
            setNotes(notesArr)
        })
        
        //onSnapshot returns function that will cause the notesCollection 
        //  object to stop listening/disconnect to the firebase DB
        return unsubscribe
    }, [])

    React.useEffect(() => {
        if(!currentNoteId)
            setCurrentNoteId(notes[0]?.id)
    }, [notes])



    //Creates a new note and ands it to fireStore DB
    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here"
        }
        const tempNote = await addDoc(notesCollection, newNote)
        setCurrentNoteId(tempNote.id)
    }

    //onSnapshot will set notes, this just needs to push changes
    //gets the current doc and sets it according to the passed text
    async function updateNote(text) {
        const tempDoc = doc(db, "notes", currentNoteId)
        await setDoc(tempDoc, {body: text}, {merge: true})
    }

    async function deleteNote(noteId) {
        const docRef = doc(db, "notes", noteId)
        await deleteDoc(docRef)
    }


    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={notes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        <Editor
                            currentNote={currentNote}
                            updateNote={updateNote}
                        />
                        
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}
