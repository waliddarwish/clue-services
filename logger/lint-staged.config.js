module.exports = {
  '**/*.+(js|jsx|md|ts|css|sass|less|graphql|yml|yaml|scss|json|vue)': [
    'prettier --write',
    'jest --findRelatedTests',
  ],
};
