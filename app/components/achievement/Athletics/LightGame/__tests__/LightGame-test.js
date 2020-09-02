import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import LightGame from '../LightGame';
import Enzyme from "enzyme";

it('renders correctly', () => {
  Enzyme.configure({ adapter: new Adapter() })
  const wrapper = shallow(
    <LightGame testing={true}/>
  );
  expect(wrapper).toMatchSnapshot();
});