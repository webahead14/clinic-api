const updateMatrices = (matrices, matrix) => {
  const index = matrices.findIndex(
    (mat) => mat.matrixGroup === matrix.matrixGroup
  );
  if (index === -1) {
    matrices.push(matrix);
  } else {
    matrices[index].matrixQuestions = [
      ...matrices[index].matrixQuestions,
      ...matrix.matrixQuestions,
    ];
  }
};

export default updateMatrices;
