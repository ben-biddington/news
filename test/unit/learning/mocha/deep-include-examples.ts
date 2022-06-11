import { expect } from 'chai';

// It is not possible that I have found yet to assert that an array of objects contains
// an object that is a superset of an expected value.
// This would be useful for ignoring newly-added keys
//
// https://www.chaijs.com/api/bdd/#method_include
//
// When the target is an array, .include asserts that the given val is a member of the target.
//
//    expect([1, 2, 3]).to.include(2);
//
// When the target is an object, .include asserts that the given object val’s properties are a subset of the target’s properties.
//
//    expect({a: 1, b: 2, c: 3}).to.include({a: 1, b: 2});
//
describe('deep.include', () => {
  it('does not do subset matching', () => {

    const actual = [
      {
        type: "news-items-modified",
        items: [
          {
            id: "id",
            title: "title",
            url: "https://bbc.co.uk/example",
            deleted: false,
            new: false,
            hostIsBlocked: true,
            label: "lobsters",
          },
        ]
      },
      {
        type: "news-items-modified",
        items: []
      }
    ]

    expect(actual).to.not.deep.include.members([
      // When comparing with `members` members, it doesn't do `include` matching, i.e., you can't
      // match subset like this:
      {
        type: "news-items-modified",                                                 // No match because ALL keys are missing
      }
      // The thing you give it must have ALL the same keys
    ]);

    expect(actual).to.not.deep.include.members([
      {
        type: "news-items-modified",
        items: [
          {
            // id: "id",                                                             // Not match because of single missing key
            title: "title",                                                          // in sub object 
            url: "https://bbc.co.uk/example",
            deleted: false,
            new: false,
            hostIsBlocked: true,
            label: "lobsters",
          }
        ]
      }
    ]);

    expect(actual).to.deep.include.members([
      {
        type: "news-items-modified",
        items: [
          {
            id: "id",
            title: "title",
            url: "https://bbc.co.uk/example",
            deleted: false,
            new: false,
            hostIsBlocked: true,
            label: "lobsters",
          }
        ]
      }
    ]);
  })
})