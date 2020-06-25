class Cloneable {
    clone(fun) {
      const clone = Object.create(this);
      fun(clone);
      return clone;
    }
  }
  
  module.exports.Cloneable = Cloneable;