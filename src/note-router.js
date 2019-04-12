'use strict';

const express = require('express');

const noteRouter = express.Router();
const bodyParser = express.json();
const uuid = require('uuid/v4');
const logger = require('./logger');
const noteService = require('./note-service');
const xss = require('xss');

const serializeNote = note => ({
  id: note.id,
  name: xss(note.name),
  modified: note.modified,
  folderId: xss(note.folderid),
  content: xss(note.content),
});



noteRouter
  .route('/')
  .get((req,res,next) => {

    const knexInstance = req.app.get('db');
    noteService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes);
      })
      .catch(next);
  })
  .post(bodyParser, (req,res,next) => {
    const {name, modified, folderId,content } = req.body;
    const id = uuid();
    const folderid = folderId;
    const newNote = {id,name, modified, folderid,content };

    for (const [key, value] of Object.entries(newNote)) {
      if ((value === null || value === undefined)) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    noteService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(`/api/notes/${note.id}`)
          .json(note);
      })
      .catch(next);
  });


noteRouter
  .route('/:id')
  .all((req, res, next) => {
    noteService.getNoteById(
      req.app.get('db'),
      req.params.id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: 'note doesn\'t exist' }
          });
        }
        res.note = note; // save the article for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req,res,next) => {
    return res.json(serializeNote(res.note));
  })
  .delete((req,res,next) => {
    const { id } = req.params;
    const knexInstance = req.app.get('db');
    noteService.deleteNote(knexInstance,id)
      .then(() => {
        return res.status(204).end();
      }
      )
      .catch(next);
  })
  .patch(bodyParser,(req,res,next) => {
    const { name, modified, folderId,content } = req.body;
    const updateNote = { name, modified, folderId,content };
    const numberOfValues = Object.values(updateNote).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: 'Request body must content either \'name\', \'modified\' or \'folderId\', \'content\''
        }
      });
    }
    noteService.updateNote(
      req.app.get('db'),
      req.params.id,
      updateNote
    ) .then(updated => {
      res.status(204).end();
    })
      .catch(next);
  });

module.exports = noteRouter;