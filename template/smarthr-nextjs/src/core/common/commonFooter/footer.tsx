import Link from "next/link"


const CommonFooter = () => {
    return (
        <>
            <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
                <p className="mb-0">2014 - 2026 © SmartHR.</p>
                <p>
                    Designed &amp; Developed By{" "}
                    <Link href="#" className="text-primary">
                        Dreams
                    </Link>
                </p>
            </div>
        </>
    )
}

export default CommonFooter