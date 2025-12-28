package com.notes.ui

import android.os.Bundle
import android.os.Handler
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.notes.data.NotesDatabase
import com.notes.data.NotesRepository
import com.notes.model.Note
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Timer
import java.util.TimerTask

/**
 * Notes App Main Activity
 * Contains various Android lifecycle and threading bugs
 */
class MainActivity : AppCompatActivity() {

    // BUG: Static reference to Activity causes memory leak
    companion object {
        var currentActivity: MainActivity? = null
        var cachedNotes: List<Note> = emptyList()
    }

    private lateinit var repository: NotesRepository
    
    // BUG: Handler with default looper leaks Activity
    private val handler = Handler()
    
    // BUG: Timer not cancelled on destroy
    private var autoSaveTimer: Timer? = null
    
    // BUG: Anonymous inner class holds reference to Activity
    private val noteUpdateListener = object : NotesRepository.OnNotesChangedListener {
        override fun onNotesChanged(notes: List<Note>) {
            // BUG: Updating UI from background thread
            updateNotesList(notes)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        // BUG: Static reference to Activity
        currentActivity = this
        
        repository = NotesRepository(NotesDatabase.getInstance(this))
        repository.addListener(noteUpdateListener)
        
        // BUG: Long-running task on main thread
        val notes = repository.getAllNotesSync()
        cachedNotes = notes
        
        setupAutoSave()
        loadNotes()
    }
    
    private fun setupAutoSave() {
        // BUG: Timer task holds reference to Activity, never cancelled
        autoSaveTimer = Timer()
        autoSaveTimer?.scheduleAtFixedRate(object : TimerTask() {
            override fun run() {
                // BUG: Accessing UI from Timer thread
                saveCurrentNote()
            }
        }, 0, 30000)
    }
    
    private fun loadNotes() {
        // BUG: Using deprecated asyncTask pattern equivalent
        Thread {
            val notes = repository.getAllNotesSync()
            
            // BUG: Updating UI from background thread
            updateNotesList(notes)
        }.start()
    }
    
    private fun updateNotesList(notes: List<Note>) {
        // BUG: This is called from background thread
        // Should use runOnUiThread or proper coroutine
        // notesAdapter.submitList(notes)
        Toast.makeText(this, "Loaded ${notes.size} notes", Toast.LENGTH_SHORT).show()
    }
    
    private fun saveCurrentNote() {
        // BUG: Accessing view from background thread
        // val content = editText.text.toString()
        
        lifecycleScope.launch(Dispatchers.IO) {
            // This is correct, but the Timer that calls this is wrong
            repository.saveNote(Note(content = "Auto-saved"))
        }
    }
    
    fun deleteNote(noteId: Long) {
        // BUG: Database operation on main thread
        repository.deleteNoteSync(noteId)
        
        // BUG: Using Handler that leaks Activity
        handler.postDelayed({
            Toast.makeText(this@MainActivity, "Note deleted", Toast.LENGTH_SHORT).show()
        }, 1000)
    }
    
    // BUG: Not calling removeListener in onDestroy
    override fun onDestroy() {
        super.onDestroy()
        // Missing: repository.removeListener(noteUpdateListener)
        // Missing: autoSaveTimer?.cancel()
        // Missing: handler.removeCallbacksAndMessages(null)
        // BUG: Not clearing static reference
        // currentActivity = null  // Should be done but isn't
    }
    
    // BUG: Wrong lifecycle method for configuration changes
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        // BUG: Saving heavy data in instance state
        // This will cause TransactionTooLargeException
        outState.putParcelableArrayList("all_notes", ArrayList(cachedNotes.map { it.toParcelable() }))
    }
    
    // BUG: Configuration change causes state loss
    override fun onConfigurationChanged(newConfig: android.content.res.Configuration) {
        super.onConfigurationChanged(newConfig)
        // BUG: Not preserving view state during rotation
        // Views get recreated but state is lost
    }
}

// BUG: Fragment doesn't handle lifecycle properly
class NoteDetailFragment : androidx.fragment.app.Fragment() {
    
    // BUG: Using Activity reference that might be null after detach
    private var activityRef: MainActivity? = null
    
    // BUG: Lateinit var not initialized before access
    private lateinit var note: Note
    
    override fun onAttach(context: android.content.Context) {
        super.onAttach(context)
        activityRef = context as? MainActivity
    }
    
    override fun onViewCreated(view: android.view.View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // BUG: Accessing lateinit before it's initialized
        displayNote(note)
        
        // BUG: Using requireActivity() in coroutine that might outlive Fragment
        viewLifecycleOwner.lifecycleScope.launch {
            withContext(Dispatchers.IO) {
                val updatedNote = loadNoteFromDb()
                // BUG: Fragment might be detached when this completes
                requireActivity().runOnUiThread {
                    displayNote(updatedNote)
                }
            }
        }
    }
    
    private fun displayNote(note: Note) {
        // Display note content
    }
    
    private suspend fun loadNoteFromDb(): Note {
        // Simulate database load
        kotlinx.coroutines.delay(1000)
        return Note(id = 1, content = "Loaded")
    }
    
    override fun onDetach() {
        super.onDetach()
        // BUG: Not nulling out activity reference
        // activityRef = null
    }
}
