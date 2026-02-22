import React from 'react'
import { IoReloadSharp } from 'react-icons/io5';

function Loader() {
    return (
        <div className="min-h-screen w-full absolute top-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-black">
            <IoReloadSharp className="loader" />
        </div>
    )
}

export default Loader