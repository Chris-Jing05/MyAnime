module.exports = function (options, webpack) {
  const externals = Array.isArray(options.externals)
    ? options.externals
    : [options.externals].filter(Boolean);

  return {
    ...options,
    externals: [
      ...externals,
      {
        '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
        'mock-aws-s3': 'commonjs mock-aws-s3',
        'aws-sdk': 'commonjs aws-sdk',
        'nock': 'commonjs nock',
      },
    ],
    module: {
      ...options.module,
      rules: [
        ...options.module.rules,
        {
          test: /\.html$/,
          type: 'asset/resource',
        },
      ],
    },
  };
};
