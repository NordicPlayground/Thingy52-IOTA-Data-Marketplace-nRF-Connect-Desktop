import subprocess
import venv
import sys
import os

class ExtendedEnvBuilder(venv.EnvBuilder):
    pass

def run():
    if sys.version_info < (3, 3):
        print("Must be run with python 3.3")
        return

    builder = ExtendedEnvBuilder(
        with_pip = True,
    )

    dir_path = os.path.dirname(os.path.realpath(__file__))

    print("Creating virtual environment in", dir_path)

    builder.create(dir_path + '/env/')

    try:
        subprocess.call([
            dir_path + '/env/bin/pip',
            'install',
            '-r',
            dir_path + '/requirements.txt',
        ], cwd=dir_path)
    except:
        os.rmdir(dir_path + '/env/')

if __name__ == '__main__':
    run()
