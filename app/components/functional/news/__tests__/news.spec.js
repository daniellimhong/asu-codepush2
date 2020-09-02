import 'react-native';
import React from 'react';
import { News } from '../';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

it('renders correctly', () => {
	 const tree = renderer.create(
			<News />
   ).toJSON();
   expect(tree).toMatchSnapshot();
});
