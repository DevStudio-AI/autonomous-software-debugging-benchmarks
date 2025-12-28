package com.notes.data

import com.notes.model.Note
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

/**
 * Repository for Note operations
 * Contains patterns that lead to lifecycle bugs when used improperly
 */
class NotesRepository(private val database: NotesDatabase) {
    
    private val dao = database.noteDao()
    private val repositoryScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    
    // BUG: Listener pattern without proper lifecycle management
    private val listeners = mutableListOf<OnNotesChangedListener>()
    
    interface OnNotesChangedListener {
        fun onNotesChanged(notes: List<Note>)
    }
    
    /**
     * Add a listener for notes changes
     * BUG: If Activity adds listener but doesn't remove in onDestroy, it leaks
     */
    fun addListener(listener: OnNotesChangedListener) {
        listeners.add(listener)
    }
    
    /**
     * Remove a listener
     * BUG: Callers often forget to call this in onDestroy
     */
    fun removeListener(listener: OnNotesChangedListener) {
        listeners.remove(listener)
    }
    
    private fun notifyListeners(notes: List<Note>) {
        // BUG: This is called from background thread but listeners update UI
        listeners.forEach { it.onNotesChanged(notes) }
    }
    
    /**
     * Get all notes as Flow - proper reactive pattern
     */
    fun getAllNotes(): Flow<List<Note>> = dao.getAllNotes()
    
    /**
     * Get all notes synchronously
     * BUG: Calling this from main thread blocks UI
     */
    fun getAllNotesSync(): List<Note> = dao.getAllNotesSync()
    
    /**
     * Get note by ID
     */
    suspend fun getNoteById(id: Long): Note? = dao.getNoteById(id)
    
    /**
     * Save a note
     */
    suspend fun saveNote(note: Note): Long {
        val id = dao.insert(note)
        // Notify listeners after save
        repositoryScope.launch {
            val allNotes = dao.getAllNotesSync()
            notifyListeners(allNotes)
        }
        return id
    }
    
    /**
     * Delete a note synchronously
     * BUG: This blocks the calling thread - problematic on main thread
     */
    fun deleteNoteSync(noteId: Long) {
        dao.deleteByIdSync(noteId)
        // BUG: Notifying listeners from same thread
        val allNotes = dao.getAllNotesSync()
        notifyListeners(allNotes)
    }
    
    /**
     * Delete a note properly
     */
    suspend fun deleteNote(note: Note) {
        dao.delete(note)
    }
    
    /**
     * Update a note
     */
    suspend fun updateNote(note: Note) {
        dao.update(note)
        repositoryScope.launch {
            val allNotes = dao.getAllNotesSync()
            notifyListeners(allNotes)
        }
    }
}
