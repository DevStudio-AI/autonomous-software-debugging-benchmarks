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
    companion object {
        var currentActivity: MainActivity? = null
        var cachedNotes: List<Note> = emptyList()
    }

    private lateinit var repository: NotesRepository
    private val handler = Handler()
    private var autoSaveTimer: Timer? = null
    private val noteUpdateListener = object : NotesRepository.OnNotesChangedListener {
        override fun onNotesChanged(notes: List<Note>) {
            updateNotesList(notes)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        currentActivity = this
        
        repository = NotesRepository(NotesDatabase.getInstance(this))
        repository.addListener(noteUpdateListener)
        val notes = repository.getAllNotesSync()
        cachedNotes = notes
        
        setupAutoSave()
        loadNotes()
    }
    
    private fun setupAutoSave() {
        autoSaveTimer = Timer()
        autoSaveTimer?.scheduleAtFixedRate(object : TimerTask() {
            override fun run() {
                saveCurrentNote()
            }
        }, 0, 30000)
    }
    
    private fun loadNotes() {
        Thread {
            val notes = repository.getAllNotesSync()
            updateNotesList(notes)
        }.start()
    }
    
    private fun updateNotesList(notes: List<Note>) {
        // Should use runOnUiThread or proper coroutine
        // notesAdapter.submitList(notes)
        Toast.makeText(this, "Loaded ${notes.size} notes", Toast.LENGTH_SHORT).show()
    }
    
    private fun saveCurrentNote() {
        // val content = editText.text.toString()
        
        lifecycleScope.launch(Dispatchers.IO) {
            // This is correct, but the Timer that calls this is wrong
            repository.saveNote(Note(content = "Auto-saved"))
        }
    }
    
    fun deleteNote(noteId: Long) {
        repository.deleteNoteSync(noteId)
        handler.postDelayed({
            Toast.makeText(this@MainActivity, "Note deleted", Toast.LENGTH_SHORT).show()
        }, 1000)
    }
    override fun onDestroy() {
        super.onDestroy()
        // Missing: repository.removeListener(noteUpdateListener)
        // Missing: autoSaveTimer?.cancel()
        // Missing: handler.removeCallbacksAndMessages(null)
        // currentActivity = null  // Should be done but isn't
    }
    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        // This will cause TransactionTooLargeException
        outState.putParcelableArrayList("all_notes", ArrayList(cachedNotes.map { it.toParcelable() }))
    }
    override fun onConfigurationChanged(newConfig: android.content.res.Configuration) {
        super.onConfigurationChanged(newConfig)
        // Views get recreated but state is lost
    }
}
class NoteDetailFragment : androidx.fragment.app.Fragment() {
    private var activityRef: MainActivity? = null
    private lateinit var note: Note
    
    override fun onAttach(context: android.content.Context) {
        super.onAttach(context)
        activityRef = context as? MainActivity
    }
    
    override fun onViewCreated(view: android.view.View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        displayNote(note)
        viewLifecycleOwner.lifecycleScope.launch {
            withContext(Dispatchers.IO) {
                val updatedNote = loadNoteFromDb()
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
        // activityRef = null
    }
}
