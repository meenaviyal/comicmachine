
(function(global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = {}),
      clone  = fabric.util.object.clone;

  /**
   * ScalableTextbox class, based on Textbox, 
   * exhibits scaling behaviour similar to IText when parent group selection is scaled.
   * Behaviour similar to Textbox in all other cases.
   * @class fabric.ScalableTextbox
   * @extends fabric.Textbox
   * @mixes fabric.Observable
   * @return {fabric.ScalableTextbox} thisArg
   * @see {@link fabric.Textbox#initialize} for constructor definition
   */
  fabric.ScalableTextbox = fabric.util.createClass(fabric.Textbox, fabric.Observable, {

    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'scalable-textbox',

    /**
     * Override Textbox class value
     */
    lockScalingY: false,

     /**
     * Allow scaling when part of a group
     * @param {String} key
     * @param {Any} value
     */
    setOnGroup: function(key, value) {
      /* Overrides Textbox class behaviour. Do nothing. */
    }, 

  });

  /**
   * Returns fabric.ScalableTextbox instance from an object representation
   * @static
   * @memberOf fabric.ScalableTextbox
   * @param {Object} object Object to create an instance from
   * @return {fabric.ScalableTextbox} instance of fabric.ScalableTextbox
   */
  fabric.ScalableTextbox.fromObject = function(object) {
    return new fabric.ScalableTextbox(object.text, clone(object));
  };

  /**
   * Returns the default controls visibility required for ScalableTextboxes.
   * @returns {Object}
   */
  fabric.ScalableTextbox.getTextboxControlVisibility = function() {
    return {
      tl: false,
      tr: false,
      br: false,
      bl: false,
      ml: true,
      mt: false,
      mr: true,
      mb: false,
      mtr: true
    };
  };

})(typeof exports !== 'undefined' ? exports : this);
