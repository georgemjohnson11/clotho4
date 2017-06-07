'use strict';

const Joi = require('joi');
const MongoModels = require('mongo-models');
const Feature = require('./feature');

class Annotation extends MongoModels {

  static create(name, description, start, end, sequenceId, userId, isForwardStrand, callback) {

    const document = {
      name: name,
      description: description,
      start: start,
      end: end,
      sequenceId: sequenceId,
      userId: userId,
      isForwardStrand: isForwardStrand
    };

    this.insertOne(document, (err, docs) => {

      if (err) {
        return callback(err);
      }
      callback(null, docs[0]);
    });
  }

  static findBySequenceId(sequenceId, callback) {

    const query = {'sequenceId': sequenceId};
    this.find(query, (err, annotations) => {

      if (err) {
        return callback(err);
      }

      this.getFeatures(0,annotations,callback);
    });
  }

  static getFeatures(index,annotations,callback) {

    if(index == annotations.length){
      return callback(null, annotations);
    }

    Feature.findByAnnotationId(annotations[index]['_id'], (err,features) => {

      if(err) {
        callback(err,null);
      }

      if(features.length != 0) {
        annotations[index].features = features;
      }

      return this.getFeatures(index+1, annotations,callback);
    });
  }

// Original Java
//   /**
//    * Reverse the orientation of the annotation (reverse complement
//    * it and flip flop the start and end sites).  Called from NucSeq
//    * when it's reverse complemented
//    * @param seqLength
//    */
//   public void invert(int seqLength) {
//   isForwardStrand = !isForwardStrand;
//   int s = start;
//   start = seqLength - end;
//   end = seqLength - s;
// }
//
}


Annotation.collection = 'annotations';

// Does not include shareableobjbase properties.
Annotation.schema = Joi.object().keys({
  _id: Joi.object(),
  name: Joi.string().required(),
  description: Joi.string(),
  start: Joi.number().integer().positive().required(),
  end: Joi.number().integer().positive().required(),
  sequenceId: Joi.string().required(),
  userId: Joi.string().required(),
  isForwardStrand: Joi.boolean().required()
});

Annotation.indexes = [
  {key: {userId: 1}}
];

module.exports = Annotation;
