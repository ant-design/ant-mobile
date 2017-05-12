import glob from 'glob';
import React from 'react';
import { render } from 'enzyme';
import { renderToJson } from 'enzyme-to-json';
import renderer from 'react-test-renderer';
import MockDate from 'mockdate';
import preactRender from 'preact-render-to-string';

function preactDemoTest(component, options = {}) {
  const files = glob.sync(`./components/${component}/demo/*.md`);

  files.forEach((file) => {
    let testMethod = options.skip === true ? test.skip : test;
    if (Array.isArray(options.skip) && options.skip.some(c => file.includes(c))) {
      testMethod = test.skip;
    }
    testMethod(`renders ${file} correctly`, () => {
      MockDate.set(new Date('2016-11-22').getTime());
      const demo = require(`../.${file}`).default; // eslint-disable-line global-require, import/no-dynamic-require
      expect(preactRender(demo)).toMatchSnapshot();
      MockDate.reset();
    });
  });
}

function reactDemoTest(component, options = {}) {
  const files = glob.sync(`./components/${component}/demo/*.md`);

  files.forEach((file) => {
    let testMethod = options.skip === true ? test.skip : test;
    if (Array.isArray(options.skip) && options.skip.some(c => file.includes(c))) {
      testMethod = test.skip;
    }
    testMethod(`renders ${file} correctly`, () => {
      MockDate.set(new Date('2016-11-22').getTime());
      const demo = require(`../.${file}`).default; // eslint-disable-line global-require, import/no-dynamic-require
      const wrapper = render(demo);
      expect(renderToJson(wrapper)).toMatchSnapshot();
      MockDate.reset();
    });
  });
}

export function webDemoTest(...args) {
  if (process.env.TEST_ENV === 'preact') {
    preactDemoTest(...args);
  } else {
    reactDemoTest(...args);
  }
}

export function rnDemoTest(component, options = {}) {
  const files = glob.sync(`./components/${component}/demo/*.tsx`);

  files.forEach((file) => {
    let testMethod = options.skip === true ? test.skip : test;
    if (Array.isArray(options.skip) && options.skip.some(c => file.includes(c))) {
      testMethod = test.skip;
    }

    testMethod(`renders ${file} correctly`, () => {
      const Demo = require(`../.${file}`).default; // eslint-disable-line global-require, import/no-dynamic-require
      const tree = renderer.create(<Demo />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
}
