import React from "react";
import { CommunityUnion } from "./CommunityUnion";
import * as Enzyme from "enzyme";
import ReactSixteenAdapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new ReactSixteenAdapter() });

describe("<CommunityUnion />", () => {
  it("should render 1 <CommunityUnion /> component", () => {
    const component = Enzyme.shallow(<CommunityUnion />);
    expect(component).toHaveLength(1);
  });
});
