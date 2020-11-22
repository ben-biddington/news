class Title {
    constructor(application, document) {
        this.title = document.title;
        
        application.on(['lobsters-items-loaded', 'hacker-news-items-loaded'], e => {
            console.log(JSON.stringify(e, null, 2));
            
            document.title = e.items.length > 0 ? `* ${this.title}` : this.title;
        });
    }
}   

module.exports.Title = Title;