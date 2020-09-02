import 'react-native';
import React from 'react';
import { List } from '../';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

it('renders correctly', () => {
	 const tree = renderer.create(
			<List />
   ).toJSON();
   expect(tree).toMatchSnapshot();
});
