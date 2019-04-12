'use strict';

const folderService = {
  getAllFolders(db) {
    return (
      db.select('*').from('folders')
    );
  },

  getFolderById(db, id) {
    return (
      db.select('*').from('folders').where('id', id).first()
    );
  },

  deleteFolder(db, id) {
    return (
      db.select('*').from('folders').where('id', id).delete()
    );
  },

  insertFolder(db, newItem) {
    return db.insert(newItem).into('folders')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
    
  },

  updateFolder(db, id, updates) {
    return (
      db('folders')
        .where({id})
        .update(updates)
    );
  } 
};

module.exports = folderService;