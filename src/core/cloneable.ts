export class Cloneable {
    clone(fun = _ => {}) {
      const clone = Object.create(this);
    
      Object.assign(clone, this);

      fun(clone);
      
      return clone;
    }
  }