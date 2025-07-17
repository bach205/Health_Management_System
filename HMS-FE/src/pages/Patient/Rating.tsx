import { Flex } from "antd";

const Rating = ({ rating = 0 }: { rating: number }) => {
    rating = +rating;

    rating = (Math.random() ) + 4;
    return (
        rating > 0 ?
        <Flex gap={10} align="center" className="w-full">
            <div className="flex items-center gap-1" data-rating={rating}>
                {
                    Array.from({ length: 5 }).map((_, index) => {
                        const i = index + 1;
                        const isHalf = (i > rating) && (i < rating + 1);
                        const isFilled = i <= rating;
                        const percent = rating - Math.floor(rating);
                        const width = +(percent * 12).toFixed(1);
                        return (
                            <div key={index} className="inline-block w-[12px] relative h-[20px]">
                                <div className="text-gray-500 absolute top-0 left-0 ">★</div>
                                {isFilled && (
                                    <div className="text-yellow-500 absolute top-0 left-0 w-[12px] overflow-hidden">★</div>
                                )}

                                {isHalf && (
                                    <div style={{ width: `${+width}px` }} className={`text-yellow-500 absolute top-0 left-0  overflow-hidden`}>★</div>
                                )}

                            </div>
                        )
                    })
                }

            </div>
            <p className="text-gray-600 text-sm"><span className="font-medium">{rating.toFixed(1)   }</span> trên 5</p>

        </Flex>
        :
        <p className="text-gray-600 text-sm">Chưa có đánh giá</p>
    );
}
export default Rating;