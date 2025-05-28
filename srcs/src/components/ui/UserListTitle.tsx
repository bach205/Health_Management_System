const UserListTitle = ({ title }: { title: string }) => {
    return (
        <>
            <h2 className="text-indigo-600! text-2xl font-bold mb-3">
                Quản lý {title}
            </h2>
            <p className="text-gray-500 text-sm mb-5">
                <span className="text-indigo-600">Quản lý</span> &gt; {title.charAt(0).toUpperCase() + title.slice(1)}
            </p>
        </>
    );
}

export default UserListTitle;