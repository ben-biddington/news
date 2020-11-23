<script>
    import NewsPanel from './NewsPanel.vue';

    //const loadLobstersNews = () => window.application.lobsters.list().then(result => lobstersNews = result);

    let lobstersNews = [];

    // https://vuejs.org/v2/api/#Options-Data
    export default {
        components : { NewsPanel },
        data() {
            return {
                application: null,
                lobsters: {
                    id:         'lobsters',
                    useCase:    'lobsters',
                    title:      'lobsters',
                    source:     [  ]
                },
                hackerNews: {
                    id:         'hackerNews',
                    useCase:    'hackerNews',
                    title:      'Hacker News',
                    source:     [  ]
                },
                bookmarks: {
                    id:         'bookmarks',
                    useCase:    'bookmarks',
                    title:      'bookmarks',
                    source:     [  ]
                },
            };
        },
        methods: {
            bookmarkId(bookmark) {
                return `bookmark-${bookmark.id}`;
            },
            bookmarkDelete(bookmark) {
                return `javascript:application.bookmarks.del('${bookmark.id}')`;   
            }
        },
        updated: function () {
            this.$nextTick(function () {
                window.view.notifyRendering();
            })
        },
        async beforeMount() {
            await Promise.all([
                window.application.lobsters.list(), 
                window.application.hackerNews.list(), 
                window.application.bookmarks.list()]);

            this.application            = window.application;
            this.lobsters.source        = await window.application.lobsters.list();
            this.hackerNews.source      = await window.application.hackerNews.list();
            this.bookmarks.source       = await window.application.bookmarks.list();

            application.on([ "lobsters-item-deleted", "lobsters-item-snoozed" ], 
                e => this.lobsters.source = this.lobsters.source.filter(it => it.id != e.id));

            application.on([ "hacker-news-item-deleted" ], 
                e => this.hackerNews.source = this.hackerNews.source.filter(it => it.id != e.id));

            application.on("lobsters-items-loaded"      , e         => this.lobsters.source     = e.items);
            application.on("hacker-news-items-loaded"   , e         => this.hackerNews.source   = e.items);
            application.on("bookmark-added"             , bookmark  => this.bookmarks.source    = [...this.bookmarks.source, bookmark ]);
            application.on("bookmark-deleted"           , e         => this.bookmarks.source    = this.bookmarks.source.filter(it => it.id != e.id));
        }
    };
</script>

<template>
    <body>
        <div id="application">
            <div id="navigation">
                <ul class="items">
                    <li class="logo"><img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg" width="20" height="20" /></li>
                </ul>
            </div>
            <div id="news">
                <news-panel :application="application" :id="lobsters.id" 
                            :useCase="lobsters.useCase"     :title="lobsters.title"     :source="lobsters.source" />
                <news-panel :application="application" :id="hackerNews.id" :allowSnooze="false" 
                            :useCase="hackerNews.useCase"   :title="hackerNews.title"   :source="hackerNews.source" />
            
                <div id="bookmarks">
                    <div class="title">Bookmarks ({{ bookmarks.source.length }})</div>
                    <ol class="items">
                        <li v-for="bookmark in this.bookmarks.source" :key="bookmark.id" class="item" :id=bookmarkId(bookmark)>
                            <a :href="bookmark.url" class="title">{{ bookmark.title }}</a>
                            <a
                                :href=bookmarkDelete(bookmark)
                                class="del"
                                title="Delete item">
                                delete
                            </a>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    </body>
</template>