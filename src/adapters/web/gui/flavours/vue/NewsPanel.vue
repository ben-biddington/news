<script>
    export default {
        props: { 
            id:             { type: String }, 
            useCase:        { type: String }, 
            title:          { type: String },
            source:         { type: Array   , default: [] }, 
            showAge:        { type: Boolean , default: true }, 
            showHost:       { type: Boolean , default: true },
            allowBookmark:  { type: Boolean , default: true },
            allowSnooze:    { type: Boolean , default: true },
            application:    { type: Object },
        },
        methods: {
            trim(text, count) {
                const ellipsis = text.length > count ? '...' : '';
                return `${text.substring(0, count)}${ellipsis}`;
            },
            bookmarkLink(newsItem) {
                return `javascript:application.bookmarks.add('${newsItem.id}')`;
            },
            snoozeLink(useCase, newsItem) {
                return `javascript:application.${useCase}.snooze('${newsItem.id}')`;
            },
            deleteLink(useCase, newsItem) {
                return `javascript:application.${useCase}.delete('${newsItem.id}')`;
            },
            newsItemId(newsItem) {
                return `news-${newsItem.id}`;
            }
        },
    };
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

<template>
    <div :id="id" class="bs-component">
        <div class="title">{{ title }}</div>
        <transition-group name="fade" tag="ol" class="items list-group">
        <!-- <ol class="items list-group"> -->
            <li v-for="newsItem in source" :key="newsItem.id" class='item list-group-item' v-bind:class="{deleted: newsItem.deleted}" :id=newsItemId(newsItem)>
                <transition name="fade">
                    <div class="item-body">
                        <div class="lead">
                            <a :href="newsItem.url" class="title" :title="newsItem.title">{{ trim(newsItem.title) }}</a>
                            <div class="meta">
                                <span v-if="showAge" class="age">{{ newsItem.ageSince(application.now()) }}</span>
                                <span v-if="showHost" class="host">{{ newsItem.host }}</span>
                            </div>
                        </div>
                        <div class="controls">
                            <a v-if="allowBookmark"
                                :href=bookmarkLink(newsItem)
                                class="bookmark btn btn-success">
                                bookmark
                            </a>
                            <a v-if="allowSnooze"
                                :href=snoozeLink(useCase,newsItem) 
                                class="snooze btn btn-warning"
                                title="Snooze item">
                                snooze
                            </a>
                            <a v-if="!newsItem.deleted"
                                :href=deleteLink(useCase,newsItem) 
                                class="del btn btn-danger"
                                title="Delete item">
                                delete
                            </a>
                        </div>    
                    </div>
                </transition>
            </li>
        </transition-group>
    </div>
</template>