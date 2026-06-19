const palette = {
  cream: "#F6EEE1",
  creamDeep: "#EFE3CF",
  ink: "#1F1320",
  evergreen: "#1F3A2E",
  evergreenSoft: "#375A48",
  coral: "#E87461",
  coralDeep: "#C9543F",
  peach: "#F5B896",
  honey: "#D9A441",
  sage: "#6F8A73",
  sageSoft: "#A8BDA6",
  terracotta: "#B8624A",
  moss: "#4F6B4A",
  muted: "#8A7C83",
  line: "#E6D9C4",
  white: "#FFFFFF",
  danger: "#B54B3A",
};

const Colors = {
  palette,
  light: {
    background: palette.cream,
    surface: palette.white,
    surfaceAlt: palette.creamDeep,
    text: palette.ink,
    textMuted: palette.muted,
    tint: palette.coral,
    accent: palette.evergreen,
    terracotta: palette.terracotta,
    moss: palette.moss,
    sage: palette.sage,
    honey: palette.honey,
    line: palette.line,
    tabIconDefault: palette.muted,
    tabIconSelected: palette.evergreen,
  },
};

export default Colors;
