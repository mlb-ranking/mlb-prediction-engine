## See Docs Page - 

# Init for Debian based systems. Run from root of project

# Confirm that virtual env is installed and install requirements

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA3129274
echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org
