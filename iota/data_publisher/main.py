from iota import Iota, ProposedTransaction, Address, TryteString
import datetime
import argparse
import requests
import mampy
import time
import sys
import re

endpoint = 'https://api.marketplace.tangle.works/newData'

def attach(trytes, root):
    transfers = [
        ProposedTransaction(
            address = Address(root),
            message = TryteString(trytes),
            value   = 0,
        )
    ]
    return iota.send_transfer(
        depth = 6, # default value
        min_weight_magnitude = 14,
        transfers = transfers,
    )

def publish(iota, mam_cnl, data_string, idmp_data=None):
    side_key = mampy.generate_key(81)

    print("Encrypting data...")
    sys.stdout.flush()
    message, root, address = mam_cnl.create(data_string, side_key)

    print("Publishing to IOTA Tangle...")
    sys.stdout.flush()
    tangle_publish_begin = time.time()
    attach(message, address)
    tangle_publish_end = time.time()
    print("Published to IOTA Tangle (%.2fs)" % (tangle_publish_end - tangle_publish_begin))
    sys.stdout.flush()

    if idmp_data is not None:
        packet = {
            'id': idmp_data['device_id'],
            'sk': idmp_data['device_sk'],
            'packet': {
                'sidekey': side_key,
                'root': root,
                'time': int(datetime.datetime.now().timestamp() * 1000),
            }
        }

        requests.post(endpoint, json=packet)
        print("Pushed to IOTA Data Marketplace")
        sys.stdout.flush()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Publish data to the IOTA tangle and the IOTA Data Marketplace.')
    parser.add_argument('--seed', metavar='SEED', type=str)
    parser.add_argument('--devid', metavar='DEVID', type=str)
    parser.add_argument('--secret-key', metavar='SK', type=str)
    parser.add_argument('data')

    args = parser.parse_args()

    data = args.data
    seed = args.seed or mampy.generate_key(81)

    if not re.match(r'^[A-Z9]{81}$', seed):
        print('Seed must be an 81 character long tryte string [A-Z9].')
        exit()

    idmp_data = {
        'device_id': args.devid,
        'device_sk': args.secret_key,
    }

    iota = Iota('https://testnet140.tangle.works')
    cnl = mampy.MamChannel(seed, 2)

    publish(iota, cnl, data, idmp_data)

    print("Published successfully")
