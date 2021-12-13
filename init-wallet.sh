#!/usr/bin/env bash

if [ -d "docker/datadir/regtest/wallets/default" ] 
then
    bitcoin-cli -regtest -datadir=docker/datadir loadwallet "default" || true
else
    bitcoin-cli -regtest -datadir=docker/datadir createwallet "default"
fi
