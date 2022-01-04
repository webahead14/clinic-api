const deleteProps = (obj, props) => {
  for (const p of props) {
    p in obj && delete obj[p];
  }
};

export default deleteProps;
