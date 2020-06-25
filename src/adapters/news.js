const del = (ports = {}, opts = {}) => {
    const { internet, trace = _ => {} } = ports;
    const { url = '/news/items', id = 'unknown' } = opts;
  
    return internet.delete(`${url}/${id}`).then(reply => { trace(reply); return reply; });
}

const listDeleted = (ports = {}, opts = {}) => {
    const { internet, trace = _ => {} } = ports;
    
    const { baseUrl = '' } = opts;
  
    return internet.get(`${baseUrl}/news/items/deleted`).
        then(reply => { trace(reply); return reply; }).
        then(r => JSON.parse(r.body));
}

const deletedCount = (ports = {}, opts = {}) => {
    const { internet, trace = _ => {} } = ports;
    
    const { baseUrl = '' } = opts;
  
    return internet.get(`${baseUrl}/news/items/deleted/count`).
        then(reply => { trace(reply); return reply; }).
        then(r => JSON.parse(r.body));
}

module.exports.del = del;
module.exports.listDeleted = listDeleted;
module.exports.deletedCount = deletedCount;