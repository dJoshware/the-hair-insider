"use client";

export function Overlay() {
    return (
        <>
            {/* Fixed background layer */}
            <div
                className='pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat'
                style={{
                    backgroundImage: "var(--home-bg)",
                }}
            />

            {/* Overlay layer (for readability) */}
            <div className='pointer-events-none fixed inset-0 -z-10 bg-background/0 backdrop-blur-[5px]' />
        </>
    );
}
