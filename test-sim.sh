#!/bin/bash

EXPIRY=$(($(date +%s) + 600))

curl -s -X POST "https://testnet.movementnetwork.xyz/v1/transactions/simulate?estimate_gas_unit_price=true&estimate_max_gas_amount=false&skip_auth_key_validation=true" \
  -H "Content-Type: application/json" \
  -d "{
    \"sender\": \"0x8159edd881bec8e3204a9e4729a82124e05a61847467342a4465df1f3e5e4c3b\",
    \"sequence_number\": \"0\",
    \"max_gas_amount\": \"100000\",
    \"gas_unit_price\": \"100\",
    \"expiration_timestamp_secs\": \"$EXPIRY\",
    \"payload\": {
      \"type\": \"entry_function_payload\",
      \"function\": \"0x1::aptos_account::transfer\",
      \"type_arguments\": [],
      \"arguments\": [\"0x8159edd881bec8e3204a9e4729a82124e05a61847467342a4465df1f3e5e4c3b\", \"1000000\"]
    },
    \"signature\": {
      \"type\": \"ed25519_signature\",
      \"public_key\": \"0x8159edd881bec8e3204a9e4729a82124e05a61847467342a4465df1f3e5e4c3b\",
      \"signature\": \"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000\"
    }
  }"
