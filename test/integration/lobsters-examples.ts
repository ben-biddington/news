const expect = require('chai').expect;

import { list } from '../../src/adapters/lobsters';

const trace = process.env.TRACE ? console.log : () => { }

const { get, cannedGet } = require('./support/net');

// npm run test.integration -- --grep lobs
describe('How lobsters fetches the latest items', async () => {
  it('for example, 10', async () => {
    const result = await list({ get, trace }, { count: 10 });

    expect(result.length).to.eql(10);
  });

  it('from local server', async () => {
    const result = await list({ get, trace }, { count: 10, url: 'http://localhost:8080/lobsters/hottest' });

    expect(result.length).to.eql(10);
  });
});

describe('How lobsters maps news items', async () => {
  it('for example', async () => {
    const exampleReply = [
      {
        short_id: 'ipe4ii',
        short_id_url: 'https://lobste.rs/s/ipe4ii',
        created_at: '2020-06-05T12:35:31.000-05:00',
        title: 'Building an easy on the eyes IKEA style blog, in no time, for free, again',
        url: 'https://sgolem.com/building-an-easy-on-the-eyes-ikea-style-blog-in-no-time-for-free-again/',
        score: 10,
        upvotes: 10,
        downvotes: 0,
        comment_count: 27,
        description: '',
        comments_url: 'https://lobste.rs/s/ipe4ii/building_easy_on_eyes_ikea_style_blog_no',
        submitter_user: {
          username: 'stjepangolemac',
          created_at: '2018-01-25T15:24:50.000-06:00',
          is_admin: false,
          about: '',
          is_moderator: false,
          karma: 37,
          avatar_url: '/avatars/stjepangolemac-100.png',
          invited_by_user: 'loige'
        },
        tags: ['javascript', 'web']
      }
    ]

    const result = await list({ get: cannedGet(JSON.stringify(exampleReply)), trace });

    const actual = result[0];

    expect(actual.id).to.eql('ipe4ii');
    expect(actual.title).to.eql('Building an easy on the eyes IKEA style blog, in no time, for free, again');
    expect(actual.url).to.eql('https://sgolem.com/building-an-easy-on-the-eyes-ikea-style-blog-in-no-time-for-free-again/');
    expect(actual.date).to.eql(new Date('2020-06-05T12:35:31.000-05:00'));
  });

  it('filters out items with blank url', async () => {
    const exampleReply = [
      {
        "short_id": "afgczv",
        "short_id_url": "https://lobste.rs/s/afgczv",
        "created_at": "2020-06-23T16:54:24.000-05:00",
        "title": "Suggestions for a lightweight project management app?",
        "url": "",
        "score": 2,
        "upvotes": 2,
        "downvotes": 0,
        "comment_count": 3,
        "description": "<p>We need an application that will serve to track the dependency DAG of incomplete tasks and act as a mutex for someone to claim a task. I’d like to be able to visualize it as an actual graph and not just as a list of tasks with the edges hidden in the task details.</p>\n<p>Jira is slow, and Trello doesn’t let you explicitly track dependencies between tasks. Is there software like what I describe that people here enjoy using?</p>\n",
        "comments_url": "https://lobste.rs/s/afgczv/suggestions_for_lightweight_project",
        "submitter_user": {
          "username": "judson",
          "created_at": "2019-04-08T14:58:07.000-05:00",
          "is_admin": false,
          "about": "",
          "is_moderator": false,
          "karma": 81,
          "avatar_url": "/avatars/judson-100.png",
          "invited_by_user": "baweaver"
        },
        "tags": [
          "ask",
          "practices"
        ]
      }
    ];

    const result = await list({ get: cannedGet(JSON.stringify(exampleReply)), trace });

    expect(result).to.be.empty;
  })
});