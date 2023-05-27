import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { onSnapshot, addDoc, doc, deleteDoc, setDoc} from "firebase/firestore"
import { notesCollection, db } from "./firebase" 


export default function App() {
    const [notes, setNotes] = React.useState([])
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    const [tempNoteTxt, setTempNoteTxt] = React.useState("")

    //I uses assign because array.sort() will alter the orignal array
    const sortedNotes = Object.assign([], notes)
    sortedNotes.sort((a, b) => b.updatedAt - a.updatedAt)

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

    /**
     * connects to the firebase Database 
     */
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

    /**
     * sets the currentNoteId
     */
    React.useEffect(() => {
        if(!currentNoteId)
            setCurrentNoteId(notes[0]?.id)
    }, [notes])

    /**
     * sets the tempNoteTxt
     */
    React.useEffect(() => {
        if(currentNote  )
            setTempNoteTxt(currentNote.body)
    }, [currentNote])

    /**
     * used for debouncing
     * when the user types, it alters tempNoteTxt causeing this to run
     * Causes the program to wait for 500ms before pushing the changes to 
     * firebase. When typing, a character and then another, if the second
     * is withing 500ms then the change is not pushed since cleartimeout is 
     * called.
     * hanges only get pushed when the user stops typing
     */
    React.useEffect(() => {
        const timeOutId = setTimeout(() => {
            updateNote(tempNoteTxt)
        }, 500)

        return () => clearTimeout(timeOutId)
    }, [tempNoteTxt])

    /**
     * Creates a new note and pushes it to the db
     */
    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        const tempNote = await addDoc(notesCollection, newNote)
        setCurrentNoteId(tempNote.id)
    }

    /**
     * onSnapshot will set notes, this just needs to push changes
     * gets passed the tempNoteTxt and makes it into a doc
     */
    async function updateNote(text) {
        if(!(text === currentNote.body)){
            const tempDoc = doc(db, "notes", currentNoteId)
            await setDoc(tempDoc, {
                    body: text,
                    updatedAt: Date.now()
                }, 
                {merge: true})
        }
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
                            notes={sortedNotes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        <Editor
                            tempNoteTxt={tempNoteTxt}
                            updateNote={setTempNoteTxt}

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
