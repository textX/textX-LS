echo Building and copying python wheels

extension_dir="$(dirname "$(pwd)")"

client_wheels_dir="$extension_dir/client/wheels/"
mkdir -p $client_wheels_dir

core_dir="$extension_dir/textX-LS/core/"
core_dist_dir="$core_dir/dist"

server_dir="$extension_dir/textX-LS/server/"
server_dist_dir="$server_dir/dist"


# Build wheels
cd $core_dir && python setup.py sdist bdist_wheel > /dev/null 2>&1
cd $server_dir && python setup.py sdist bdist_wheel > /dev/null 2>&1

# Copy wheels
cd $core_dist_dir && cp *.whl $client_wheels_dir
cd $server_dist_dir && cp *.whl $client_wheels_dir
