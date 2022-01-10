rm -f -- hardhat.log &> /dev/null

npx hardhat node &> hardhat.log &
last_pid=$!

while ! ( grep -q 'Account #19:' ./hardhat.log )
	do
		sleep 1
		echo "Waiting for node..."
	done

sleep 1
rm hardhat.log
cd ..

npx jest

kill $last_pid
