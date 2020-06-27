class Cloneable {
    clone(fun = () => {}) {
      const clone = Object.create(this);
    
      Object.assign(clone, this);

      fun(clone);
      
      return clone;
    }
  }
  
  module.exports.Cloneable = Cloneable;