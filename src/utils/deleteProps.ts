const deleteProps = (obj, props) => {
  for (const property of props) {
    property in obj && delete obj[property];
  }
};

export default deleteProps;
