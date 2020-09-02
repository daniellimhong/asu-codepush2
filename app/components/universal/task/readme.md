# Task

A representation of a task.
Some event/todo that requires your attention and your action, typically having deadline/are time sensitive

**Task Model**
```js
{
  id: 'String',
  title: 'String',
  body: 'String',
  done: 'Boolean',
  tags: ['String','...',...], // labels/category
  date: {
    start: 'ISO', // iso will include year month day time
    end: 'ISO',   // use a library to break down these values
  },
  config: { // configs are optional
    checklist: 'Boolean',
  },
}
```

