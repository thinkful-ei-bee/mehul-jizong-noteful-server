'use strict';

const noteService = {
  getAllNotes(db) {
    return (
      db.select('*').from('notes')
    );
  },

  getNoteById(db, id) {
    return (
      db.select('*').from('notes').where('id', id).first()
    );
  },

  deleteNote(db, id) {
    return (
      db.select('*').from('notes').where('id', id).delete()
    );
  },

  insertNote(db, newItem) {
    return db.insert(newItem).into('notes')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
    
  },

  updateNote(db, id, updates) {
    return (
      db('notes')
        .where({id})
        .update(updates)
    );
  } 
};

module.exports = noteService;
