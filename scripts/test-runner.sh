rm node.log 2> /dev/null

cd ..

docker compose up &> scripts/node.log &

echo 'See node logs in scripts/node.log'

while ! ( grep -q 'Account #19:' scripts/node.log )
	do
		sleep 2
		echo "Waiting for node..."
		cat scripts/node.log
	done

sleep 1

jest

docker compose down
