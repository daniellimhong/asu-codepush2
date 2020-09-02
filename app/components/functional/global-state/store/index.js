import React from "react";
import useGlobalHook from "use-global-hook";

import * as actions from "../actions";

const initialState = {
        SDRLoginStatus: false,
        campusWeekSchedule: false,
        showCampusModal: false,
        refetchWeeklySchedule: false,
        screen: null,
        section: null,
        surveySubmitted: false
    }

const useGlobal = useGlobalHook(React, initialState, actions);

export default useGlobal;