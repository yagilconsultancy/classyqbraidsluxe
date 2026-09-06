import { useLocation, Link } from 'react-router-dom';
import { Home, Scissors, Calendar, ShoppingBag, Phone } from 'lucide-react';

export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1) || '/';

    const suggestions = [
        { icon: Home, label: 'Home', path: '/', desc: 'Return to the main page' },
        { icon: Scissors, label: 'Browse Styles', path: '/styles', desc: 'Explore our braiding styles' },
        { icon: Calendar, label: 'Book Appointment', path: '/book', desc: 'Schedule your visit' },
        { icon: ShoppingBag, label: 'Shop Extensions', path: '/shop', desc: 'Browse hair extensions' },
        { icon: Phone, label: 'Contact Us', path: '/contact', desc: 'Get in touch with us' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-beige">
            <div className="max-w-lg w-full">
                <div className="text-center space-y-8">
                    {/* 404 Error Code */}
                    <div className="space-y-3">
                        <h1 className="text-8xl font-display font-light text-gold/40 leading-none">404</h1>
                        <div className="hair-line w-20 mx-auto"></div>
                    </div>

                    {/* Main Message */}
                    <div className="space-y-3">
                        <h2 className="text-3xl font-display text-onyx">
                            Page Not Found
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We couldn't find the page <span className="font-medium text-onyx">"{pageName}"</span>.
                            It may have been moved, renamed, or no longer exists.
                        </p>
                    </div>

                    {/* Suggestions */}
                    <div className="pt-2">
                        <p className="text-xs uppercase tracking-widest text-gold mb-4">Try one of these instead</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {suggestions.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <Link
                                        key={s.path}
                                        to={s.path}
                                        className="group flex items-center gap-3 p-3 bg-white border border-border rounded-sm hover:border-gold/40 hover:bg-gold/5 transition-all duration-200"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
                                            <Icon className="w-4 h-4 text-gold" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-onyx">{s.label}</p>
                                            <p className="text-xs text-muted-foreground">{s.desc}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary-foreground bg-gold hover:bg-gold/90 rounded-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold"
                        >
                            <Home className="w-4 h-4" />
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}