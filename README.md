# News

A news aggregator written in ports and adapters style. Supports multiple GUI frameworks.

## Setup

```shell
$ npm install
```

### Build

```shell
$ ./run.sh
```

#### Build with angular support

```shell
$ ./run.sh --with-angular-js
```

### Test 

```shell
$ ./test.sh
```

#### Test at different levels

```
$ npm run test.unit
```

```
$ npm run test.integration
```

```
$ npm run test.system
```

## Usage

```shell
$ ./run.sh
```

### Toggle GUI framework with query string

These ones pass all tests: 

* http://localhost:8080/home.html?use-svelte
* http://localhost:8080/home.html?use-vue
* http://localhost:8080/home.html?use-react

This one is partially implemented:

* http://localhost:8080/home.html?use-polymer

This one does not work yet:

* http://localhost:8080/home.html?use-angular

![Svelte screenshot](https://github.com/ben-biddington/news/blob/7fde3938eca6f40b3dbba9eade0c93488164a41b/doc/assets/vanilla-svelte-24-jun-2020.png)