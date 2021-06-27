export const del = (ports: any = {}, opts: any = {}) => {
    const { internet, trace = _ => {} } = ports;
    const { baseUrl = '', id = 'unknown' } = opts;
  
    return internet.delete(`${baseUrl}/news/items/${id}`).then(reply => { trace(reply); return reply; });
}

export const listDeleted = (ports: any = {}, opts: any = {}) => {
    const { internet, trace = _ => {} } = ports;
    
    const { baseUrl = '' } = opts;
  
    return internet.get(`${baseUrl}/news/items/deleted`).
        then(reply => { trace(reply); return reply; }).
        then(r => JSON.parse(r.body));
}

export const deletedCount = (ports: any = {}, opts: any = {}) => {
    const { internet, trace = _ => {} } = ports;
    
    const { baseUrl = '' } = opts;
  
    return internet.get(`${baseUrl}/news/items/deleted/count`).
        then(reply => { trace(reply); return reply; }).
        then(r => JSON.parse(r.body));
}