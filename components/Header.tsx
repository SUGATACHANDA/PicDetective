"use client"

import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Image
                            src={"/logo.png"}
                            alt="PicDetective"
                            width={40}
                            height={40}
                            className="mr-3"
                        />
                        <h1 className="text-2xl font-bold text-orange-500">
                            PicDetective
                        </h1>
                    </div>
                    <nav>
                        <ul className="flex space-x-4">
                            <Link
                                href={"#"}
                                className="text-gray-600 hover:text-orange-500 transition duration-150 ease-in-out"
                            >
                                Home
                            </Link>
                            <Link
                                href={"#how-it-works"}
                                className="text-gray-600 hover:text-orange-500 transition duration-150 ease-in-out"
                            >
                                How It Works
                            </Link>
                            <Link
                                href={"#features"}
                                className="text-gray-600 hover:text-orange-500 transition duration-150 ease-in-out"
                            >
                                Features
                            </Link>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;