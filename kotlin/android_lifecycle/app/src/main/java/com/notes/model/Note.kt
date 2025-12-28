package com.notes.model

import android.os.Parcel
import android.os.Parcelable
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "notes")
data class Note(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String = "",
    val content: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val isPinned: Boolean = false
) {
    /**
     * Convert to Parcelable for Bundle storage
     * BUG: This encourages storing in savedInstanceState which can cause TransactionTooLargeException
     */
    fun toParcelable(): NoteParcelable = NoteParcelable(this)
}

/**
 * Parcelable wrapper for Note
 * Used for passing between Activities/Fragments and saving state
 */
class NoteParcelable(private val note: Note) : Parcelable {
    
    val id: Long get() = note.id
    val title: String get() = note.title
    val content: String get() = note.content
    val createdAt: Long get() = note.createdAt
    val updatedAt: Long get() = note.updatedAt
    val isPinned: Boolean get() = note.isPinned
    
    constructor(parcel: Parcel) : this(
        Note(
            id = parcel.readLong(),
            title = parcel.readString() ?: "",
            content = parcel.readString() ?: "",
            createdAt = parcel.readLong(),
            updatedAt = parcel.readLong(),
            isPinned = parcel.readByte() != 0.toByte()
        )
    )
    
    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeLong(note.id)
        parcel.writeString(note.title)
        parcel.writeString(note.content)
        parcel.writeLong(note.createdAt)
        parcel.writeLong(note.updatedAt)
        parcel.writeByte(if (note.isPinned) 1 else 0)
    }
    
    override fun describeContents(): Int = 0
    
    fun toNote(): Note = note
    
    companion object CREATOR : Parcelable.Creator<NoteParcelable> {
        override fun createFromParcel(parcel: Parcel): NoteParcelable {
            return NoteParcelable(parcel)
        }
        
        override fun newArray(size: Int): Array<NoteParcelable?> {
            return arrayOfNulls(size)
        }
    }
}
