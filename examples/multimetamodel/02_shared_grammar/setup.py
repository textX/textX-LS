from setuptools import setup, find_packages

setup(name='types_data_flow_dsls',
      version='0.1',
      description='(example)',
      url='',
      author='YOUR NAME',
      author_email='YOUR.NAME@ADDRESS',
      license='TODO',
      packages=find_packages(),
      package_data={'': ['*.tx']},
      install_requires=["textx", "arpeggio"],
      tests_require=[
          'pytest',
      ],
      keywords="parser meta-language meta-model language DSL",
      entry_points={
          'console_scripts': [
              'types_data_flow_dsls_validate=types_data_flow_dsls.console:validate',
          ]
      },
      )
