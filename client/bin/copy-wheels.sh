echo Building and copying python wheels

extension_dir="$(dirname "$(pwd)")"

client_wheels_dir="$extension_dir/client/wheels/"
mkdir -p $client_wheels_dir

core_dir="$extension_dir/textX-LS/core/"
server_dir="$extension_dir/textX-LS/server/"

# Build wheels
cd $core_dir && python setup.py sdist bdist_wheel > /dev/null 2>&1
cd $server_dir && python setup.py sdist bdist_wheel > /dev/null 2>&1

# Copy wheels
cd "$core_dir/dist" && cp *.whl $client_wheels_dir
cd "$server_dir/dist" && cp *.whl $client_wheels_dir
