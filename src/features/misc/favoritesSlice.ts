import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { ICrewMember } from "../../types/crew-member";

type State = { crewMembers: ICrewMember[]; }

export const favoritesSlice = createSlice({
    name: "favorites",
    initialState: {
        crewMembers: []
    } as State,
    reducers: {
        addFavorite: (state, action: PayloadAction<ICrewMember>) => {
            state.crewMembers.push(action.payload);
        },
        removeFavorite: (state, action: PayloadAction<{id: string}>) => {
            state.crewMembers = state.crewMembers.filter(favorite => favorite.id !== action.payload.id);
        },
        updateFavorite: (state, action: PayloadAction<{oldId: string; updatedCrewMember: ICrewMember}>) => {
            state.crewMembers = state.crewMembers.map(favorite => {
                if (favorite.id === action.payload.oldId) {
                    favorite = { ...action.payload.updatedCrewMember };   
                }
                return favorite;
            });
        }
    }
});

export const selectFavorites = (state: RootState) => state.favorites.crewMembers;
export const { addFavorite, removeFavorite, updateFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
