import { create } from 'zustand';


const themesToColors = {
  "customized": {
    leftWall: "#f45405",
    rightWall: "#e80606",
    floor: "#100101",
    background: "#f0d400"
  },
  "black-orange": {
    leftWall: "#f45405",
    rightWall: "#e80606",
    floor: "#100101",
    background: "#f0d400"
  },
  "pink-blue": {
    leftWall: "#2905f4",
    rightWall: "#068ee8",
    floor: "#dccece",
    background: "#f80088"
  },
  "white": {
    leftWall: "#f2e8e3",
    rightWall: "#f3cbcb",
    floor: "#8f8383",
    background: "#f0d400"
  }
  
}

const setColorsAsInTheme = (state: RoomState) => {
  const theme = themesToColors[state.global.theme]
  console.log("theme", state.global.theme)
  return {
    background: {
      ...state.background,
      color: theme.background,
    },
    rightWall: {
      ...state.rightWall,
      color: theme.rightWall,
    },
    leftWall: {
      ...state.leftWall,
      color: theme.leftWall,
    },
    floor: {
      ...state.floor,
      color: theme.floor,
    },
  };
};

export const useRoomStore = create<RoomState>(set => ({
  global: { brightness: 'bright', visible: true, theme: 'black-orange' },
  info: { description: 'New Room', category: 'none' },
  background: { color: '#7d7d7d', accent: '#7d7d7d' },
  leftWall: { color: '#7d7d7d', hidden: false, texture: 'none' },
  rightWall: { color: '#7d7d7d', hidden: false, texture: 'none' },
  floor: { color: '#444444', hidden: false, texture: 'none' },

  update: (path, values) => {
    set(state => {
      const newState = {
      ...state,
      [path]: {
        ...(state[path as keyof RoomState] as object),
        ...values,
      },
    }
    if (path == "global") {
      return {...newState, ...setColorsAsInTheme(newState)}
    }
    else if (["background", "leftWall", "rightWall", "floor"].includes(path)) {
      console.log("color changed")
      return {...newState, global: {
        ...state.global,
        theme: "customized"}
      }
    }
    return newState
    })
    
    
  }
}));
